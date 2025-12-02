import { createContext,useContext,useEffect,useRef } from "react";
import {io,Socket} from 'socket.io-client'

const SocketContext=createContext<Socket|null>(null)

export const SocketProvider=({children}:{children:React.ReactNode})=>{
    const socketRef=useRef<Socket|null>(null)

    useEffect(()=>{
        const socket=io(
            import.meta.env.VITE_BACKEND_SERVER_URL||'http://localhost:8000',
            {
                transports:['websocket']
            }
        )
        socketRef.current=socket

        socket.on('connect',()=>{
            console.log("Global socket connected",socket.id);
        })

        socket.on('disconnect',()=>{
            console.log("Global socket disconnected");
        })

        return ()=>{
            socket.disconnect()
        }
    },[])

    return(
        <SocketContext.Provider value={socketRef.current}>
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket=()=>useContext(SocketContext)