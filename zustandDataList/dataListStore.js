import { create } from 'zustand'

const useStore = create((set) => ({
  dataList: [],
  inc: (data) => set((state) => {
    console.log('inc called');
    return { dataList: [...state.dataList, ...data] }
  }),
}))

export default useStore;