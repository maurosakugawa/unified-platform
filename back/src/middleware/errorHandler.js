export function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message);

  // Se a mensagem contiver "não encontrado", retornar 404
  const isNotFound = err.message && err.message.toLowerCase().includes('não encontrado');
  const status = isNotFound ? 404 : (err.status || 500);

  res.status(status).json({
    error: err.message || 'Erro interno do servidor',
  });
}
