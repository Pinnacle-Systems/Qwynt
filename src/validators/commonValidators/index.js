import { prisma } from "../../lib/prisma.js"


export async function validateSupplierActive(supplierId){
    const supplier = await prisma.party.findUnique({
        where:{
            supplierId: parseInt(supplierId)
        }
    })
    return supplier.active
} 