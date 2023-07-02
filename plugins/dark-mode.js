export default function ({ app, store }) {
  const updateDarkModeClass = () => {
    const darkMode = store.state.darkMode;
    
    if (process.client) {
      const rootElement = document.documentElement;

      if (darkMode) {
        rootElement.classList.add('dark-mode');
      } else {
        rootElement.classList.remove('dark-mode');
      }
    }
  };

  app.$darkMode = {
    getDarkModeClass() {
      return store.state.darkMode ? 'dark-mode' : '';
    }
  };

  store.watch(
    (state) => state.darkMode,
    updateDarkModeClass
  );

  // Call the initial update to set the dark mode class
  updateDarkModeClass();
  
  //fetch initial setting
  store.dispatch('initializeDarkMode');
}
