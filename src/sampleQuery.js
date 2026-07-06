import { prisma } from '../lib/prisma.js'


async function getStock() {
    return await prisma.$queryRaw`
    select itemType, yarnId, fabricId from stock 
    group by itemType, yarnId, fabricId;  
    `
}
let data = await getStock();
console.log(data, "getStock")