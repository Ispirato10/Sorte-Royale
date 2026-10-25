import { jsPDF } from 'jspdf';
import { GeneratedGame } from '../types';
import { LOTTERIES } from '../data/lotteries';

const getLotteryRGB = (lotteryId: string): [number, number, number] => {
  switch (lotteryId) {
    case 'megasena': return [5, 150, 105];    // Emerald
    case 'lotofacil': return [147, 51, 234];  // Purple
    case 'quina': return [2, 132, 199];       // Blue
    case 'lotomania': return [234, 88, 12];   // Orange
    case 'duplasena': return [220, 38, 38];   // Red
    default: return [202, 138, 4];            // Gold
  }
};

export const generateTicketPDF = (game: GeneratedGame): boolean => {
  try {
    const config = LOTTERIES.find(l => l.id === game.lotteryId);
    const themeRGB = getLotteryRGB(game.lotteryId);

    // Standard receipt format: 105mm width, 160mm height (A6-like)
    // Adjust height dynamically if there are many numbers (e.g. Lotofácil 15-20 or Lotomania 50)
    const isLargeSet = game.numbers.length > 25;
    const pageHeight = isLargeSet ? 220 : 165;
    const pageWidth = 105;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pageWidth, pageHeight]
    });

    // 1. Ticket Background & Outer Border
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Outer hairline border with rounded corners
    doc.setDrawColor(217, 119, 6); // Golden Amber
    doc.setLineWidth(0.8);
    doc.roundedRect(4, 4, pageWidth - 8, pageHeight - 8, 3, 3, 'D');

    doc.setDrawColor(226, 232, 240); // Soft inner divider
    doc.setLineWidth(0.3);
    doc.roundedRect(5.5, 5.5, pageWidth - 11, pageHeight - 11, 2, 2, 'D');

    // 2. Header Area
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.roundedRect(7, 7, pageWidth - 14, 24, 2, 2, 'F');

    // Header Gold Title
    doc.setTextColor(245, 158, 11); // Amber 500
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('SORTE ROYALE', pageWidth / 2, 15, { align: 'center' });

    // Subtitle
    doc.setTextColor(203, 213, 225); // Slate 300
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('COMPROVANTE OFICIAL DE APOSTA', pageWidth / 2, 20, { align: 'center' });

    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setFontSize(6.5);
    doc.text('GERADOR ESTATÍSTICO INTELIGENTE', pageWidth / 2, 25, { align: 'center' });

    // 3. Info Metadata Box
    let curY = 35;
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(7, curY, pageWidth - 14, 26, 2, 2, 'FD');

    // Metadata lines
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('Modalidade:', 11, curY + 6);
    doc.setTextColor(themeRGB[0], themeRGB[1], themeRGB[2]);
    doc.text(game.lotteryName.toUpperCase(), 35, curY + 6);

    doc.setTextColor(71, 85, 105);
    doc.text('Data e Hora:', 11, curY + 13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(game.createdAt, 35, curY + 13);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('ID da Aposta:', 11, curY + 20);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(217, 119, 6);
    doc.text(`#${game.id.toUpperCase()}`, 35, curY + 20);

    // 4. Numbers Section
    curY += 31;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('DEZENAS ESCOLHIDAS', pageWidth / 2, curY, { align: 'center' });

    curY += 4;
    // Render 3D-styled circular balls in rows
    const cols = isLargeSet ? 8 : 5;
    const radius = isLargeSet ? 4 : 5.5;
    const diameter = radius * 2;
    const gap = isLargeSet ? 2.5 : 3.5;
    const totalRowWidth = cols * diameter + (cols - 1) * gap;
    const startX = (pageWidth - totalRowWidth) / 2 + radius;

    let ballX = startX;
    let ballY = curY + radius + 1;

    game.numbers.forEach((num, index) => {
      if (index > 0 && index % cols === 0) {
        ballX = startX;
        ballY += diameter + gap + 1;
      }

      // Ball shadow / 3D rim effect
      doc.setFillColor(themeRGB[0], themeRGB[1], themeRGB[2]);
      doc.circle(ballX, ballY, radius, 'F');

      // Specular shine highlight
      doc.setFillColor(255, 255, 255);
      doc.circle(ballX - radius * 0.35, ballY - radius * 0.35, radius * 0.28, 'F');

      // Number text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(isLargeSet ? 7.5 : 9);
      const numStr = String(num).padStart(2, '0');
      doc.text(numStr, ballX, ballY + (isLargeSet ? 1 : 1.2), { align: 'center', baseline: 'middle' });

      ballX += diameter + gap;
    });

    curY = ballY + radius + 5;

    // 5. Extra Numbers (Trevos / Meses / Extras) if available
    if (game.extraNumbers && game.extraNumbers.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(217, 119, 6);
      doc.text(config?.extraName ? `EXTRA - ${config.extraName.toUpperCase()}` : 'NÚMEROS EXTRAS', pageWidth / 2, curY, { align: 'center' });

      curY += 4;
      const extraCols = game.extraNumbers.length;
      const extraRadius = 4.5;
      const extraDiam = extraRadius * 2;
      const extraGap = 4;
      const extraTotalWidth = extraCols * extraDiam + (extraCols - 1) * extraGap;
      let extraX = (pageWidth - extraTotalWidth) / 2 + extraRadius;
      const extraY = curY + extraRadius;

      game.extraNumbers.forEach(ext => {
        doc.setFillColor(234, 179, 8); // Gold
        doc.circle(extraX, extraY, extraRadius, 'F');

        doc.setFillColor(255, 255, 255);
        doc.circle(extraX - extraRadius * 0.35, extraY - extraRadius * 0.35, extraRadius * 0.28, 'F');

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(String(ext), extraX, extraY + 1, { align: 'center', baseline: 'middle' });

        extraX += extraDiam + extraGap;
      });

      curY = extraY + extraRadius + 6;
    }

    // 6. Security & Validation Footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(10, curY, pageWidth - 10, curY);

    curY += 5;
    doc.setTextColor(5, 150, 105); // Emerald Green
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('[X] VALIDADO PELO SISTEMA SORTE ROYALE', pageWidth / 2, curY, { align: 'center' });

    // Barcode Simulation Lines
    curY += 4;
    const barcodeStartX = 20;
    const barcodeWidth = pageWidth - 40;
    const barcodeHeight = 7;
    doc.setFillColor(15, 23, 42);

    let bX = barcodeStartX;
    while (bX < barcodeStartX + barcodeWidth) {
      const lineWidth = (Math.random() > 0.5 ? 0.8 : 0.4) + (Math.random() > 0.8 ? 0.6 : 0);
      const lineGap = 0.5 + Math.random() * 0.7;
      if (bX + lineWidth <= barcodeStartX + barcodeWidth) {
        doc.rect(bX, curY, lineWidth, barcodeHeight, 'F');
      }
      bX += lineWidth + lineGap;
    }

    curY += barcodeHeight + 4;
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(`CÓDIGO DE AUTENTICAÇÃO: SR-${game.id.toUpperCase()}`, pageWidth / 2, curY, { align: 'center' });

    curY += 3.5;
    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Sorte Royale - Documento gerado para controle e conferência pessoal.', pageWidth / 2, curY, { align: 'center' });

    // Download PDF
    const safeName = game.lotteryName.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Bilhete_${safeName}_${game.id}.pdf`);
    return true;
  } catch (err) {
    console.error('Error generating PDF:', err);
    return false;
  }
};
