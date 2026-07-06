import bcrypt from "bcrypt";

// const password="HostelAdmin777"
const password="Admin123"
const hashedPassword = await bcrypt.hash(password, 12);
console.log(hashedPassword,"hashedPassword")
