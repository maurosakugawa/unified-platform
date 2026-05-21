// src/components/feedback/Toast.tsx
/** 
 * @author Mauro Sakugawa
 * Date: 2026-05-21
 * License: MIT License
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { Toast as BootstrapToast } from 'react-bootstrap';
interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}