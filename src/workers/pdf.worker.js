import { PDFDocument } from 'pdf-lib';

self.onmessage = async (e) => {
  const { action, payload, id } = e.data;

  try {
    if (action === 'MERGE') {
      const mergedPdf = await PDFDocument.create();
      for (const fileBuffer of payload.files) {
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedPdfFile = await mergedPdf.save();
      self.postMessage({ id, status: 'success', data: mergedPdfFile.buffer }, [mergedPdfFile.buffer]);
    }
    else if (action === 'SPLIT') {
      const sourcePdf = await PDFDocument.load(payload.fileBuffer);
      const newPdf = await PDFDocument.create();
      
      const pagesToKeep = payload.pageIndices; // e.g., [0, 2, 4] for pages 1, 3, 5
      const copiedPages = await newPdf.copyPages(sourcePdf, pagesToKeep);
      copiedPages.forEach((page) => newPdf.addPage(page));
      
      const splitPdfFile = await newPdf.save();
      self.postMessage({ id, status: 'success', data: splitPdfFile.buffer }, [splitPdfFile.buffer]);
    }
    else if (action === 'PROTECT') {
      const pdf = await PDFDocument.load(payload.fileBuffer);
      const protectedPdfFile = await pdf.save({
        userPassword: payload.password,
        ownerPassword: payload.password,
        permissions: {
          printing: 'highResolution',
          modifying: false,
          copying: false,
        },
      });
      self.postMessage({ id, status: 'success', data: protectedPdfFile.buffer }, [protectedPdfFile.buffer]);
    }

  } catch (error) {
    self.postMessage({ id, status: 'error', error: error.message });
  }
};

