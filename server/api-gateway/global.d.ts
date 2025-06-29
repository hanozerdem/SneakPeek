declare namespace Express {
  export interface Request {
    user?: any; // Burada 'any' yerine, kullanıcı verilerinizin tipini belirtmek isterseniz örneğin 'User' gibi özel bir arayüz tanımlayabilirsiniz.
  }
}
