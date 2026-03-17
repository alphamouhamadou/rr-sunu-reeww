import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const regions = await prisma.region.findMany({
    include: {
      departments: {
        include: { communes: true }
      }
    },
    orderBy: { name: 'asc' }
  })
  
  console.log('=== Données Géographiques du Sénégal ===')
  console.log('Régions:', regions.length)
  
  let totalDepts = 0
  let totalCommunes = 0
  
  for (const region of regions) {
    const deptCount = region.departments.length
    const communeCount = region.departments.reduce((sum, d) => sum + d.communes.length, 0)
    totalDepts += deptCount
    totalCommunes += communeCount
    console.log(`  ${region.name}: ${deptCount} départements, ${communeCount} communes`)
  }
  
  console.log(`\nTotal: ${totalDepts} départements, ${totalCommunes} communes`)
}

main().finally(() => prisma.$disconnect())
