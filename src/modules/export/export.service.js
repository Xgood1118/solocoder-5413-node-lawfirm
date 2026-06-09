const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { diffLines } = require('diff');
const config = require('../../config');
const fileStorage = require('../../utils/fileStorage');
const articleService = require('../article/article.service');
const { ensureDir } = require('../../utils/fileStorage');

class ExportService {
  async exportToPDF(articleId) {
    const article = articleService.getArticleById(articleId);
    if (!article) {
      throw new Error('文章不存在');
    }

    const content = fileStorage.readArticleContent(articleId);

    ensureDir(config.exportDir);
    const pdfPath = path.join(config.exportDir, `${articleId}.pdf`);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      doc.on('pageAdded', () => {
        doc.save();
        doc.fontSize(60);
        doc.fillColor(200, 200, 200, 0.3);
        doc.text(config.lawFirmName, 100, 400, {
          align: 'center',
          width: 400,
          height: 100,
        });
        doc.restore();

        doc.fontSize(10);
        doc.fillColor('gray');
        doc.text(`文章ID: ${articleId}`, 50, 800, { align: 'left' });
        doc.text(`${config.lawFirmName} 内部文档`, 50, 800, { align: 'right' });
      });

      doc.fontSize(20);
      doc.fillColor('black');
      doc.text(article.title, { align: 'center', underline: true });

      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.fillColor('gray');
      doc.text(`作者: ${article.author}`, { align: 'left' });
      doc.text(`发布时间: ${new Date(article.createdAt).toLocaleString()}`, { align: 'left' });
      doc.text(
        `标签: ${(article.tags || []).map((t) => t.name).join(', ')}`,
        { align: 'left' }
      );

      doc.moveDown(1);
      doc.fillColor('black');
      doc.fontSize(12);

      const lines = content.split('\n');
      for (const line of lines) {
        if (line.startsWith('# ')) {
          doc.moveDown(0.5);
          doc.fontSize(16);
          doc.text(line.substring(2), { bold: true });
          doc.fontSize(12);
        } else if (line.startsWith('## ')) {
          doc.moveDown(0.5);
          doc.fontSize(14);
          doc.text(line.substring(3), { bold: true });
          doc.fontSize(12);
        } else if (line.startsWith('### ')) {
          doc.moveDown(0.3);
          doc.fontSize(13);
          doc.text(line.substring(4), { bold: true });
          doc.fontSize(12);
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          doc.text(`• ${line.substring(2)}`);
        } else if (line.trim() === '') {
          doc.moveDown(0.5);
        } else {
          doc.text(line);
        }
      }

      doc.end();

      stream.on('finish', () => resolve(pdfPath));
      stream.on('error', reject);
    });
  }

  async exportToWord(articleId) {
    const article = articleService.getArticleById(articleId);
    if (!article) {
      throw new Error('文章不存在');
    }

    const content = fileStorage.readArticleContent(articleId);
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

    const children = [];

    children.push(
      new Paragraph({
        children: [new TextRun({ text: article.title, bold: true, size: 40 })],
        heading: HeadingLevel.TITLE,
        spacing: { after: 200 },
      })
    );

    children.push(
      new Paragraph({
        children: [new TextRun({ text: `作者: ${article.author}`, size: 22 })],
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `发布时间: ${new Date(article.createdAt).toLocaleString()}`, size: 22 }),
        ],
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `标签: ${(article.tags || []).map((t) => t.name).join(', ')}`,
            size: 22,
          }),
        ],
        spacing: { after: 300 },
      })
    );

    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('# ')) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line.substring(2), bold: true, size: 32 })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          })
        );
      } else if (line.startsWith('## ')) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line.substring(3), bold: true, size: 28 })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          })
        );
      } else if (line.startsWith('### ')) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line.substring(4), bold: true, size: 24 })],
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 100, after: 60 },
          })
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `• ${line.substring(2)}`, size: 22 })],
            spacing: { after: 40 },
          })
        );
      } else if (line.trim() === '') {
        children.push(new Paragraph({ children: [], spacing: { after: 100 } }));
      } else {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line, size: 22 })],
            spacing: { after: 40 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    ensureDir(config.exportDir);
    const docPath = path.join(config.exportDir, `${articleId}.docx`);
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(docPath, buffer);
    return docPath;
  }

  diffVersions(articleId, versionId1, versionId2) {
    const content1 = fileStorage.readVersion(articleId, versionId1);
    const content2 = fileStorage.readVersion(articleId, versionId2);

    if (!content1 || !content2) {
      throw new Error('版本不存在');
    }

    const diff = diffLines(content1, content2);

    const result = diff.map((part, index) => ({
      type: part.added ? 'added' : part.removed ? 'removed' : 'unchanged',
      value: part.value,
      count: part.count,
    }));

    return {
      articleId,
      versionId1,
      versionId2,
      diffs: result,
    };
  }

  async exportDiffToPDF(articleId, versionId1, versionId2) {
    const diffResult = this.diffVersions(articleId, versionId1, versionId2);

    ensureDir(config.exportDir);
    const pdfPath = path.join(config.exportDir, `${articleId}_diff_${versionId1}_${versionId2}.pdf`);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      doc.fontSize(18);
      doc.text('版本对比', { align: 'center', underline: true });

      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.fillColor('gray');
      doc.text(`文章ID: ${articleId}`, { align: 'left' });
      doc.text(`版本: ${versionId1} vs ${versionId2}`, { align: 'left' });

      doc.moveDown(1);

      for (const part of diffResult.diffs) {
        if (part.type === 'added') {
          doc.fillColor('green');
        } else if (part.type === 'removed') {
          doc.fillColor('red');
        } else {
          doc.fillColor('black');
        }

        const lines = part.value.split('\n');
        for (const line of lines) {
          if (line.trim() !== '') {
            const prefix = part.type === 'added' ? '+ ' : part.type === 'removed' ? '- ' : '  ';
            doc.fontSize(10);
            doc.text(prefix + line);
          }
        }
      }

      doc.end();

      stream.on('finish', () => resolve(pdfPath));
      stream.on('error', reject);
    });
  }
}

module.exports = new ExportService();
