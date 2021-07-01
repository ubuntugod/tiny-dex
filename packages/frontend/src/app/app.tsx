import styled from 'styled-components';

import { Route, Link } from 'react-router-dom';

const StyledApp = styled.div`
  font-family: sans-serif;
`;

export function App() {
  return (
    <StyledApp>
      TinyDEX Frontend
    </StyledApp>
  );
}

export default App;
