import { useEffect } from 'react';
import { useSocketContext } from '../Context/SocketContext';

const useListenCall = (handleIncomingCall) => {
  const { socket } = useSocketContext();

  useEffect(() => {
    const handleCall = (data) => {
        handleIncomingCall(data.name);
      console.log('Received callUser data:', data);
    };

    socket?.on('callUser', handleCall);

    return () => {
      socket?.off('callUser', handleCall);
    };
  }, [socket]);
};

export default useListenCall;