import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, IconButton, AppBar, Toolbar, Typography, Button, Box, CircularProgress } from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon } from '@mui/icons-material';

const FileViewerNew = ({ open, onClose, file }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Resetear el estado cuando cambia el archivo
    if (open) {
      setLoading(true);
      setError(null);
    }
  }, [open, file]);

  if (!file || !open) return null;

  // Obtener y procesar la URL del archivo
  const getProcessedUrl = () => {
    const baseUrl = file.cloudinaryUrl || file.fileUrl || file.url;
    if (!baseUrl) return '';

    // Si es un PDF, agregar parámetros de visualización
    if (file.mimeType === 'application/pdf' || file.fileType === 'pdf') {
      return `${baseUrl}?fl_attachment=false#toolbar=0&navpanes=0&view=FitH`;
    }

    return baseUrl;
  };

  const fileUrl = getProcessedUrl();

  // Función para abrir el archivo
  const handleDownload = () => {
    if (!fileUrl) return;
    
    // Si es PDF, abrir en una nueva pestaña con parámetros específicos
    if (file.mimeType === 'application/pdf' || file.fileType === 'pdf') {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Para otros archivos, abrir en una nueva pestaña
      window.open(file.cloudinaryUrl || file.fileUrl || file.url, '_blank');
    }
    
    // Cerrar el diálogo después de abrir el archivo
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        style: {
          background: '#f5f5f5'
        }
      }}
    >
      <AppBar position="relative" color="primary">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
            {file.displayName || file.fileName || 'Visor de Archivo'}
          </Typography>
          <Button
            color="inherit"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Abrir en nueva pestaña
          </Button>
        </Toolbar>
      </AppBar>
      <DialogContent 
        style={{ 
          padding: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#fff'
        }}
      >
        {loading && (
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CircularProgress />
          </Box>
        )}
        
        <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {error ? (
            <Box textAlign="center">
              <Typography color="error" gutterBottom>
                Error al cargar el archivo
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownload}
                startIcon={<DownloadIcon />}
              >
                Abrir en nueva pestaña
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownload}
              startIcon={<DownloadIcon />}
            >
              Abrir archivo en nueva pestaña
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewerNew;
