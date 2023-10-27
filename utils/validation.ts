import { Response } from "express";
import { fail } from "./requests";

class Validator {
  data: any;
  errors: string[];

  constructor() {
    this.data = null;
    this.errors = [];
  }

  validate(data: any): this {
    this.data = data;
    this.errors = [];
    return this;
  }

  require(field: string, message = "Field is required"): this {
    if (!this.data[field] || this.data[field] === "") {
      this.errors.push(message);
    }
    return this;
  }

  email(field: string, message = "Invalid email format"): this {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.data[field])) {
      this.errors.push(message);
    }
    return this;
  }

  minLength(
    field: string,
    length: number,
    message = `Must be at least ${length} characters`
  ): this {
    if (this.data[field].length < length) {
      this.errors.push(message);
    }
    return this;
  }

  maxLength(
    field: string,
    length: number,
    message = `Cannot exceed ${length} characters`
  ): this {
    if (this.data[field].length > length) {
      this.errors.push(message);
    }
    return this;
  }

  phone(field: string, message = "Invalid phone number"): this {
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(this.data[field])) {
      this.errors.push(message);
    }
    return this;
  }

  password(field: string): this {
    const password = this.data[field];
    if (!password || password === "") {
      this.errors.push(`${field} is required`);
    } else {
      // Check for password strength criteria
      const errors: string[] = [];
      if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
      }
      if (!/[A-Z]/.test(password)) {
        errors.push("Password must include an uppercase letter");
      }
      if (!/[a-z]/.test(password)) {
        errors.push("Password must include a lowercase letter");
      }
      if (!/\d/.test(password)) {
        errors.push("Password must include a digit");
      }
      if (!/[!@#\$%\^&*()_+{}\[\]:;<>,.?~\\\-]/.test(password)) {
        errors.push("Password must include a special character");
      }
      if (errors.length > 0) {
        this.errors.push(errors.join(", "));
      }
    }
    return this;
  }

  custom(func: (data: any) => boolean, message: string): this {
    if (!func(this.data)) {
      this.errors.push(message);
    }
    return this;
  }

  isValid(): boolean {
    return this.errors.length === 0;
  }

  getErrors(): string[] {
    return this.errors;
  }

  end(validator: any): void {
    if (!validator.isValid()) {
      const errorMessage = validator.getErrors().join(", ");
      const validationError: any = new Error(errorMessage);
      validationError.isValidationError = true; // Add a custom property
      throw validationError;
    }
  }
}

export default Validator;
