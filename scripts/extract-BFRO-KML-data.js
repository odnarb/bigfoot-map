import fs from 'fs'
import xml2js from 'xml2js'

async function main () {
  const parser = new xml2js.Parser(/* options */);

  const xml = fs.readFileSync('BFRO-All-Reports.kml')

  const result = await parser.parseStringPromise(xml)

  const BFROReports = []
  for(const reportClass of result.kml.Document[0].Folder[0].Folder) {
    const sightingClass = reportClass.name[0]
    for(const xmlReportObj of reportClass.Folder) {
      /*
        info: `Marker #${i + 1} - Random Point`
      */

      const { description, TimeStamp } = xmlReportObj.Placemark[0]
      const bfroReportId = parseInt(description[0].center[0].b[0].a[0].$.href.split('=')[1])
      const name = description[0].b[0].trim()
      BFROReports.push({
        bfroReportId,
        name,
        sightingClass,
        timestamp: TimeStamp[0].when[0].trim(),
        url: description[0].center[0].b[0].a[0].$.href,
        position: {
          lat: parseFloat(xmlReportObj.LookAt[0].latitude[0]),
          lng: parseFloat(xmlReportObj.LookAt[0].longitude[0])
        },
        source: 'BFRO'
    })
    }
  }

  fs.writeFileSync('BFRO-Reports.json', JSON.stringify(BFROReports))
}

main().then(() => console.log('done'))