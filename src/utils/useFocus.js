import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useFocus = () => {
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      const mainElement = document.querySelector('main') || document.body;
      if (mainElement) {
        mainElement.setAttribute('tabindex', '-1');
        mainElement.focus();
        mainElement.style.outline = 'none';
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);
};

export const focusElement = (element, delay = 100) => {
  setTimeout(() => {
    if (element) {
      element.setAttribute('tabindex', '-1');
      element.focus();
      element.style.outline = 'none';
    }
  }, delay);
};