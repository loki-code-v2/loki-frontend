export class User {
  name: string;
  email: string;

  // Optional attributes
  [key: string]: any;

  constructor(name: string, email: string, options: any = {}) {
    this.name = name;
    this.email = email;

    // Assign optional attributes
    for (const key in options) {
      this[key] = options[key];
    }
  }
}
