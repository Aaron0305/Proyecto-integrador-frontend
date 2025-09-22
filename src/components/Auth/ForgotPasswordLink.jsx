import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Box, Fade } from '@mui/material';
import { theme } from '../../theme/palette';

/**
 * Componente para el enlace "¿Olvidaste tu contraseña?"
 * Maneja el estilo y comportamiento del enlace de recuperación de contraseña
 */
export default function ForgotPasswordLink({ 
  delay = '500ms',
  variant = 'body2',
  sx = {},
  onClick,
  ...props 
}) {
  const handleClick = (e) => {
    // Permitir que el componente padre maneje el click si se proporciona
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Fade in={true} style={{ transitionDelay: delay }}>
      <Box sx={{ textAlign: 'right', mt: -1, mb: 1, ...sx }}>
        <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
          <Typography 
            variant={variant}
            className="forgot-password-link"
            onClick={handleClick}
            sx={{ 
              color: theme.palette.primary.main,
              cursor: 'pointer',
              position: 'relative',
              display: 'inline-block',
              '&:hover': {
                color: theme.palette.secondary.main,
                textDecoration: 'underline'
              },
              '&:focus': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: '2px',
                borderRadius: '4px'
              },
              '&:active': {
                color: theme.palette.primary.dark,
                transform: 'translateY(1px)'
              },
              transition: 'all 0.3s ease-in-out',
              // Efecto de línea animada al hover
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-2px',
                left: '50%',
                width: '0%',
                height: '2px',
                backgroundColor: theme.palette.secondary.main,
                transition: 'all 0.3s ease',
                transform: 'translateX(-50%)',
              },
              '&:hover::after': {
                width: '100%',
              }
            }}
            {...props}
          >
            ¿Olvidaste tu contraseña?
          </Typography>
        </Link>
      </Box>
    </Fade>
  );
}
