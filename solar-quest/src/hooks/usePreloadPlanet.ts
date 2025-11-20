import { useEffect, useState } from "react";
import { preloadPlanet, isPlanetPreloaded } from "@/utils/planetPreloader";

/**
 * Hook to preload planet resources (texture + data + marker imagery)
 * Perfect for VictorySequence to preload before transition
 */
export function usePreloadPlanet(
    planetId: string | null,
    shouldPreload = true,
    markers?: Array<{ name: string }>
) {
    const [isPreloaded, setIsPreloaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!planetId || !shouldPreload) {
            return;
        }

        // Check if already preloaded
        if (isPlanetPreloaded(planetId)) {
            console.log(`✅ Planet already preloaded: ${planetId}`);
            setIsPreloaded(true);
            return;
        }

        setIsLoading(true);
        setError(null);

        console.log(`🚀 usePreloadPlanet: Starting preload for ${planetId}`);

        preloadPlanet(planetId, markers)
            .then(() => {
                setIsPreloaded(true);
                setIsLoading(false);
                console.log(`✅ usePreloadPlanet: Complete for ${planetId}`);
            })
            .catch((err) => {
                setError(err);
                setIsLoading(false);
                console.error(`❌ usePreloadPlanet: Failed for ${planetId}`, err);
            });
    }, [planetId, shouldPreload, markers]);

    return { isPreloaded, isLoading, error };
}
