// Real art when it has landed, the placeholder when it has not. The one
// place the page compositor's art references meet the asset registry.

import { assets, type AssetResolver } from '../assets';
import type { ArtRef } from './layout';
import { placeholderSvg } from './placeholders';

export interface ArtSource {
  /** URL of Frank's art for this reference, or null. */
  url: string | null;
  /** Inline SVG drawn by the game — shown until the art loads, or forever. */
  placeholder: string;
  /** Short description for alt text. */
  alt: string;
}

function slotUrl(ref: ArtRef, resolver: AssetResolver): string | null {
  switch (ref.kind) {
    case 'region':
      return resolver.region(ref.region);
    case 'event':
      return resolver.event(ref.stripId);
    case 'stop':
      return resolver.stop(ref.stopId);
    case 'scene':
      return resolver.scene(ref.sceneId);
    case 'van':
      return resolver.van(ref.pose);
    case 'cover':
      return resolver.brand('cover-01');
    case 'crew':
      return null; // heads resolve one by one — see the renderer
  }
}

export function altFor(ref: ArtRef): string {
  switch (ref.kind) {
    case 'region':
      return `The road, region ${ref.region}${ref.weather !== 'none' ? `, ${ref.weather}` : ''}`;
    case 'event':
      return `${ref.stripId.replace(/-/g, ' ')}, panel ${ref.frame + 1}`;
    case 'stop':
      return `Postcard from ${ref.stopId.replace(/-/g, ' ')}`;
    case 'scene':
      return ref.sceneId.replace(/-/g, ' ');
    case 'van':
      return `The van, ${ref.pose}`;
    case 'cover':
      return 'The 8 West Trail, No. 1';
    case 'crew':
      return 'The crew';
  }
}

export function artSource(ref: ArtRef, resolver: AssetResolver = assets): ArtSource {
  return { url: slotUrl(ref, resolver), placeholder: placeholderSvg(ref), alt: altFor(ref) };
}
