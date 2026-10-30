function exportarCargaPDF() {
  const pedido = state.pedidoCargaAtual;

  if (!pedido || !pedido.ativo || !pedido.itens ||
      Object.keys(pedido.itens).length === 0) {
    mostrarToast('❌ Não existe pedido para exportar!', 'error');
    return;
  }

  if (typeof window.jspdf === 'undefined') {
    mostrarToast('❌ Biblioteca jsPDF não encontrada!', 'error');
    console.error('jsPDF não está carregada.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const itens = Object.values(pedido.itens);

  const totalPedido = itens.reduce(
    (total, item) => total + (Number(item.quantidadePedida) || 0),
    0
  );

  const totalProduzido = itens.reduce(
    (total, item) => total + (Number(item.quantidadeProduzida) || 0),
    0
  );

  const dataHora = new Date().toLocaleString('pt-BR');

  doc.setFontSize(18);
  doc.text('PEDIDO DE CARGA', 14, 18);

  doc.setFontSize(11);
  doc.text(`Código: ${pedido.codigo || 'Sem código'}`, 14, 27);
  doc.text(`Exportado em: ${dataHora}`, 14, 34);

  const linhas = itens.map(item => [
    item.nome || '',
    item.codigoInterno || '',
    Number(item.quantidadePedida) || 0,
    Number(item.quantidadeProduzida) || 0,
    (Number(item.quantidadePedida) || 0) -
      (Number(item.quantidadeProduzida) || 0)
  ]);

  if (typeof doc.autoTable !== 'function') {
    mostrarToast('❌ Biblioteca AutoTable não encontrada!', 'error');
    console.error('jsPDF AutoTable não está carregada.');
    return;
  }

  doc.autoTable({
    startY: 42,
    head: [[
      'Produto',
      'Código interno',
      'Qtd. pedida',
      'Qtd. produzida',
      'Falta produzir'
    ]],
    body: linhas,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    headStyles: {
      fillColor: [40, 90, 140],
      textColor: 255
    }
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.text(`Total pedido: ${totalPedido}`, 14, finalY);
  doc.text(`Total produzido: ${totalProduzido}`, 85, finalY);
  doc.text(
    `Total restante: ${totalPedido - totalProduzido}`,
    165,
    finalY
  );

  doc.save(`Pedido_Carga_${pedido.codigo || 'sem_codigo'}.pdf`);

  mostrarToast('✅ PDF exportado com sucesso!', 'success');
}
