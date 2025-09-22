import React from 'react';
import { Box, Alert, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon, Refresh } from '@mui/icons-material';

class AdminErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        console.log('🚨 Error Boundary - Error caught:', error);
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('🚨 Error Boundary - Full error:', error);
        console.error('🚨 Error Boundary - Error info:', errorInfo);
        
        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 3 }}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Alert severity="error" sx={{ mb: 2 }}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <ErrorIcon />
                                <Typography variant="h6">
                                    Error en el Componente de Administración
                                </Typography>
                            </Box>
                        </Alert>
                        
                        <Typography variant="body1" gutterBottom>
                            Ha ocurrido un error inesperado que está causando la pantalla blanca.
                        </Typography>
                        
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Detalles del error:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                {this.state.error && this.state.error.toString()}
                            </Typography>
                            
                            {this.state.errorInfo && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Stack trace:
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            fontFamily: 'monospace', 
                                            fontSize: '0.7rem',
                                            whiteSpace: 'pre-wrap',
                                            maxHeight: '200px',
                                            overflow: 'auto'
                                        }}
                                    >
                                        {this.state.errorInfo.componentStack}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Button 
                                variant="contained" 
                                startIcon={<Refresh />}
                                onClick={this.handleReset}
                            >
                                Intentar de Nuevo
                            </Button>
                            <Button 
                                variant="outlined" 
                                onClick={() => {
                                    console.log('🚨 Error details logged to console');
                                    console.log('Error:', this.state.error);
                                    console.log('Error Info:', this.state.errorInfo);
                                }}
                            >
                                Ver Detalles en Consola
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default AdminErrorBoundary;
