import { create } from 'zustand'

export const useTitle = create((set) => ({
     title  : 'Home',
     setTitle: (newTitle) => set(() => ({ title: newTitle })), // Función para actualizar el título
}))
