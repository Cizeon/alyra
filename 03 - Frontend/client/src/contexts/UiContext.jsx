import { createContext, useCallback, useContext, useState } from 'react';

const UiContext = createContext();

const UiProvider = (props) => {
  const [message, setMessage] = useState();

  const removeMessage = useCallback(() => {
    setMessage(null);
  }, [setMessage]);

  return (
    <UiContext.Provider value={{ message, setMessage, removeMessage }}>
      {props.children}
    </UiContext.Provider>
  );
};

const useUi = () => {
  const context = useContext(UiContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a UserProvider');
  }

  return context;
};

export { UiContext, UiProvider, useUi };
