// Este componente muestra el captcha de Google reCAPTCHA v2 y lo integra con el formulario de login
import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const SITE_KEY = 'TU_SITE_KEY_AQUI'; // Reemplaza por tu clave pública de reCAPTCHA

export default function LoginWithCaptcha({ onSubmit }) {
  const [captchaToken, setCaptchaToken] = useState(null);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCaptcha = token => {
    setCaptchaToken(token);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!captchaToken) {
      alert('Por favor resuelve el captcha');
      return;
    }
    onSubmit({ ...form, captchaToken });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Correo" value={form.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
      <ReCAPTCHA sitekey={SITE_KEY} onChange={handleCaptcha} />
      <button type="submit">Iniciar sesión</button>
    </form>
  );
}
