const express = require('express');
const router = express.Router();
const fs = require('fs');
const exportService = require('./export.service');

router.get('/:id/pdf', async (req, res) => {
  try {
    const pdfPath = await exportService.exportToPDF(req.params.id);
    const fileName = `article_${req.params.id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.get('/:id/word', async (req, res) => {
  try {
    const docPath = await exportService.exportToWord(req.params.id);
    const fileName = `article_${req.params.id}.docx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    const stream = fs.createReadStream(docPath);
    stream.pipe(res);
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.get('/:id/diff', (req, res) => {
  const { version1, version2 } = req.query;
  try {
    const diff = exportService.diffVersions(req.params.id, version1, version2);
    res.json({ success: true, data: diff });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.get('/:id/diff/pdf', async (req, res) => {
  const { version1, version2 } = req.query;
  try {
    const pdfPath = await exportService.exportDiffToPDF(req.params.id, version1, version2);
    const fileName = `diff_${req.params.id}_${version1}_${version2}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;
