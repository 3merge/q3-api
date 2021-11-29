const ExportToHtml = async (body = []) => {
  try {
    return Buffer.from(
      `<style>@media print {.pagebreak {clear: both;page-break-after: always;}}</style>${body.join(
        '<div class="pagebreak"></div>',
      )}`,
      'utf8',
    );
  } catch (e) {
    return null;
  }
};

module.exports = ExportToHtml;
