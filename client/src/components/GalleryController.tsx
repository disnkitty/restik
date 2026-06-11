import React, { useEffect, useState } from 'react';

const GALLERY_MANIFEST_PATH = '/gallery-manifest.json';

const toPublicUrl = (relativePath: string) =>
  '/' + relativePath.split('/').map(encodeURIComponent).join('/');

type GalleryImage = {
  src: string;
  name: string;
};

const getDisplayName = (relativePath: string) =>
  relativePath.split('/').pop() ?? relativePath;

const modalButtonStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#fff',
  fontSize: 32,
  border: 'none',
  cursor: 'pointer',
  padding: 12,
};

const GalleryController: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      try {
        const res = await fetch(GALLERY_MANIFEST_PATH);
        if (!res.ok) {
          if (!cancelled) setImages([]);
          return;
        }

        const manifest = (await res.json()) as unknown;
        if (!Array.isArray(manifest) || manifest.length === 0) {
          if (!cancelled) setImages([]);
          return;
        }

        const galleryImages = manifest
          .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
          .map((relativePath) => ({
            src: toPublicUrl(relativePath),
            name: getDisplayName(relativePath),
          }));

        if (!cancelled) setImages(galleryImages);
      } catch {
        if (!cancelled) setImages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight' && selectedIndex !== null)
        setSelectedIndex((i) => (i === null ? 0 : (i + 1) % images.length));
      if (e.key === 'ArrowLeft' && selectedIndex !== null)
        setSelectedIndex((i) =>
          i === null ? 0 : (i - 1 + images.length) % images.length,
        );
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIndex, images.length]);

  const removeBrokenImage = (src: string) => {
    setImages((current) => {
      const next = current.filter((image) => image.src !== src);
      setSelectedIndex((selected) => {
        if (selected === null) return null;
        if (next.length === 0) return null;
        const removedIndex = current.findIndex((image) => image.src === src);
        if (removedIndex === -1) return selected;
        return Math.min(selected, next.length - 1);
      });
      return next;
    });
  };

  const openAt = (index: number) => setSelectedIndex(index);
  const close = () => setSelectedIndex(null);
  const next = () =>
    setSelectedIndex((i) => (i === null ? 0 : (i + 1) % images.length));
  const prev = () =>
    setSelectedIndex((i) =>
      i === null ? 0 : (i - 1 + images.length) % images.length,
    );

  if (loading) {
    return <p style={{ padding: 24, color: '#555', margin: 0 }}>Loading gallery...</p>;
  }

  if (images.length === 0) {
    return (
      <div style={{ padding: 24, color: '#555' }}>
        <p style={{ margin: 0, fontSize: 16 }}>
          No images were found in <code>/public</code>.
        </p>
        <p style={{ marginTop: 8, color: '#777' }}>
          Add image files to <code>client/public</code>, then run{' '}
          <code>npm run generate-gallery-manifest</code> to refresh the gallery.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 12,
        }}
      >
        {images.map((img, idx) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.name}
            loading="lazy"
            onClick={() => openAt(idx)}
            onError={() => removeBrokenImage(img.src)}
            style={{
              width: '100%',
              height: 150,
              objectFit: 'cover',
              cursor: 'pointer',
              borderRadius: 8,
              backgroundColor: '#f4f4f4',
            }}
          />
        ))}
      </div>

      {selectedIndex !== null && images[selectedIndex] && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <button onClick={prev} style={modalButtonStyle} aria-label="previous">
            ‹
          </button>
          <img
            src={images[selectedIndex].src}
            alt={images[selectedIndex].name}
            onError={() => removeBrokenImage(images[selectedIndex].src)}
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 8 }}
          />
          <button onClick={next} style={modalButtonStyle} aria-label="next">
            ›
          </button>
          <button
            onClick={close}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'transparent',
              color: '#fff',
              fontSize: 28,
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="close"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryController;
