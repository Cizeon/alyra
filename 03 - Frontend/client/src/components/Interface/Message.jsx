import Alert from '@mui/material/Alert';

import { useUi } from '../../contexts/UiContext';

/**
 * Display an alert message to the user.
 * @params Severity, Content.
 * @returns React component.
 */
let Message = () => {
  const { message } = useUi();

  return <>{message && <Alert severity={message.severity}>{message.content}</Alert>}</>;
};

export default Message;
