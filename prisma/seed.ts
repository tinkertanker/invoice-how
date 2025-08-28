import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface BillerData {
  "MINISTRY / STATUTORY BOARD"?: string
  "DEPARTMENT"?: string
  "SUB-BUSINESS UNIT"?: string
  [key: string]: any
}

async function main() {
  console.log('Starting seed...')

  // Read and parse the government biller JSON
  const jsonPath = '/tmp/ministry-board.json'
  const jsonData = fs.readFileSync(jsonPath, 'utf-8')
  const billers: BillerData[] = JSON.parse(jsonData)

  console.log(`Found ${billers.length} government billers to import`)

  // Clear existing data
  await prisma.governmentBiller.deleteMany()

  // Import billers
  let imported = 0
  let skipped = 0
  
  for (const biller of billers) {
    try {
      const subBusinessUnit = biller["SUB-BUSINESS UNIT"]
      if (!subBusinessUnit) {
        skipped++
        continue
      }
      
      // Extract business unit code from the sub-business unit string
      // Format: "ACR01 - ACRA" -> code is "ACR01"
      const codeMatch = subBusinessUnit.match(/^([A-Z0-9]+)\s*-/)
      if (!codeMatch) {
        skipped++
        continue
      }
      
      const businessUnitCode = codeMatch[1]
      const agencyName = subBusinessUnit
      
      // Generate Peppol ID format from business unit code
      // Format: 0195:SGUENT08GA[BusinessUnitCode] (this is a placeholder - actual format may vary)
      const peppolId = `0195:SGUENT08GA${businessUnitCode}`

      await prisma.governmentBiller.create({
        data: {
          agencyName: agencyName,
          businessUnitCode: businessUnitCode,
          peppolId: peppolId,
          category: biller["MINISTRY / STATUTORY BOARD"] || "Unknown",
          parentMinistry: biller["DEPARTMENT"] || businessUnitCode,
          isPayNowEnabled: false // Will need to be updated with actual PayNow data
        }
      })
      imported++
    } catch (error) {
      // Skip duplicates silently
      if ((error as any).code === 'P2002') {
        skipped++
      } else {
        console.error(`Failed to import biller:`, error)
      }
    }
  }

  console.log(`Successfully imported ${imported} government billers, skipped ${skipped}`)

  // Add some common agencies with their actual Peppol IDs if known
  const commonAgencies = [
    {
      agencyName: "Fuhua Primary School",
      businessUnitCode: "9079",
      peppolId: "0195:SGUENT08GA0028A", // Example format
      category: "Education",
      parentMinistry: "MOE",
      isPayNowEnabled: false
    }
  ]

  for (const agency of commonAgencies) {
    try {
      await prisma.governmentBiller.upsert({
        where: { businessUnitCode: agency.businessUnitCode },
        update: agency,
        create: agency
      })
    } catch (error) {
      console.error(`Failed to upsert agency ${agency.agencyName}:`, error)
    }
  }

  console.log('Seed completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })