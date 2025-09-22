import { useNavigate } from 'react-router-dom'

export function useMenuState() {
    const navigate = useNavigate()
    return {
        startGame: () => navigate('/planet/earth'),
    }
}
