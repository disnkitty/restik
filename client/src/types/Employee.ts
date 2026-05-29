export interface Employee {
  employee_id: number;
  full_name: string;
  passport: string | null;
  phone: string | null;
  age: number | null;
  position: string | null;
  employee_email: string | null;
  employee_address: string | null;
  position_id: number | null;
  hire_date: string | null;
  work_experience_years: number | null;
  position_name?: string | null;
  position_salary?: number | null;
}

