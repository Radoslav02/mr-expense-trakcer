import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

export interface PdfExpenseRow {
  date: string;
  title: string;
  /** Second line under the title: split info, note, "Private". */
  details?: string;
  category: string;
  payment: string;
  amount: string;
}

export interface ExpensesPdf {
  fileName: string;
  title: string;
  period: string;
  filters: string;
  owner: string;
  generated: string;
  labels: { date: string; item: string; category: string; payment: string; amount: string };
  rows: PdfExpenseRow[];
  totalLabel: string;
  total: string;
  count: string;
  /** Extra totals under the table, e.g. what each partner paid. */
  summary?: { label: string; value: string; strong?: boolean }[];
  page: (page: number, pages: number) => string;
}

type VfsModule = { default?: Record<string, unknown>; vfs?: Record<string, string> };
type PdfMakeModule = {
  createPdf: (doc: TDocumentDefinitions) => { download: (name: string) => void };
  addVirtualFileSystem?: (vfs: Record<string, string>) => void;
  vfs?: Record<string, string>;
};

/** pdfmake and its fonts are large, so they load only when someone exports. */
const loadPdfMake = async (): Promise<PdfMakeModule> => {
  const [pdfMakeModule, fontsModule] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts') as Promise<VfsModule>,
  ]);
  const pdfMake = ((pdfMakeModule as { default?: unknown }).default ??
    pdfMakeModule) as PdfMakeModule;
  // The fonts file exports the font map itself; older builds nest it under `vfs`.
  const raw = fontsModule.default ?? fontsModule;
  const vfs = ('Roboto-Regular.ttf' in raw ? raw : (raw as VfsModule).vfs) as Record<
    string,
    string
  >;
  if (pdfMake.addVirtualFileSystem) pdfMake.addVirtualFileSystem(vfs);
  else pdfMake.vfs = vfs;
  return pdfMake;
};

const INK = '#1b1d1c';
const MUTED = '#686c68';
const LINE = '#e2e0d9';
const ACCENT = '#1f6f54';

/** Builds and downloads the expense list as a PDF. Roboto covers Serbian letters (č ć š ž đ). */
export const downloadExpensesPdf = async (pdf: ExpensesPdf): Promise<void> => {
  const pdfMake = await loadPdfMake();

  const header = [
    pdf.labels.date,
    pdf.labels.item,
    pdf.labels.category,
    pdf.labels.payment,
    pdf.labels.amount,
  ].map((text, index): Content => ({
    text,
    bold: true,
    fontSize: 8.5,
    color: MUTED,
    alignment: index === 4 ? 'right' : 'left',
  }));

  const body: Content[][] = pdf.rows.map((row) => [
    { text: row.date, noWrap: true },
    {
      stack: [
        { text: row.title, bold: true },
        ...(row.details ? [{ text: row.details, fontSize: 8, color: MUTED }] : []),
      ],
    },
    row.category,
    row.payment,
    { text: row.amount, alignment: 'right', noWrap: true, bold: true },
  ]);

  const doc: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 48, 40, 48],
    defaultStyle: { font: 'Roboto', fontSize: 9.5, color: INK, lineHeight: 1.15 },
    info: { title: `${pdf.title} ${pdf.period}` },
    content: [
      { text: pdf.title, fontSize: 20, bold: true, color: INK },
      { text: pdf.period, fontSize: 12, color: ACCENT, bold: true, margin: [0, 2, 0, 0] },
      { text: pdf.filters, fontSize: 9, color: MUTED, margin: [0, 4, 0, 0] },
      { text: pdf.owner, fontSize: 9, color: MUTED, margin: [0, 1, 0, 14] },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto', 'auto'],
          body: [header, ...body],
        },
        layout: {
          hLineWidth: (i) => (i === 0 ? 0 : 0.6),
          vLineWidth: () => 0,
          hLineColor: () => LINE,
          paddingTop: () => 5,
          paddingBottom: () => 5,
          paddingLeft: (i) => (i === 0 ? 0 : 6),
          paddingRight: (i, node) => (i === (node.table.widths?.length ?? 1) - 1 ? 0 : 6),
        },
      },
      {
        // Keep the totals and summary on one page.
        unbreakable: true,
        stack: [
          {
            columns: [
              { text: pdf.count, color: MUTED },
              {
                text: [
                  { text: `${pdf.totalLabel}  `, color: MUTED },
                  { text: pdf.total, bold: true, fontSize: 12 },
                ],
                alignment: 'right',
              },
            ],
            margin: [0, 10, 0, 0],
          },
          ...(pdf.summary?.length
            ? [
                {
                  margin: [0, 14, 0, 0] as [number, number, number, number],
                  table: {
                    widths: ['*', 'auto'],
                    body: pdf.summary.map((line): Content[] => [
                      { text: line.label, color: line.strong ? INK : MUTED, bold: line.strong },
                      { text: line.value, alignment: 'right', bold: true },
                    ]),
                  },
                  layout: {
                    hLineWidth: (i: number) => (i === 0 ? 0.6 : 0),
                    vLineWidth: () => 0,
                    hLineColor: () => LINE,
                    paddingTop: () => 4,
                    paddingBottom: () => 2,
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                  },
                } satisfies Content,
              ]
            : []),
        ],
      },
    ],
    footer: (page, pages) => ({
      columns: [
        { text: pdf.generated, color: MUTED, fontSize: 8 },
        { text: pdf.page(page, pages), color: MUTED, fontSize: 8, alignment: 'right' },
      ],
      margin: [40, 16, 40, 0],
    }),
  };

  pdfMake.createPdf(doc).download(`${pdf.fileName}.pdf`);
};
