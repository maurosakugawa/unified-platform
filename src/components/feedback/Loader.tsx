// src/components/feedback/Loader.tsx
/**
 * @author Mauro Sakugawa
 * Date: 2026-05-21
 * License: MIT License
 * @version 1.0.0
 */

import React from 'react';
import { CircularProgress, Box } from '@mui/material'; 

const Loader = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100%">
      <CircularProgress />
    </Box>
  );
};

export default Loader;