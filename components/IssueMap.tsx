import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Issue, IssueStatus } from '../types';
import { SEVILLA_CENTER } from '../constants';

interface IssueMapProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  focusedIssue?: Issue | null;
}

const IssueMap: React.FC<IssueMapProps> = ({ issues, onSelectIssue, focusedIssue }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    // Initialize map if not already done
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([SEVILLA_CENTER.lat, SEVILLA_CENTER.lng], 13);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Force a resize calculation to ensure tiles load correctly if container size was dynamic
      // This fixes the common "grey tiles" issue when rendering in flex containers
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const getStatusColor = (status: IssueStatus) => {
        switch(status) {
            case IssueStatus.RESOLVED: return '#48C9B0'; // Secondary/Green
            case IssueStatus.IN_PROGRESS: return '#F59E0B'; // Amber
            case IssueStatus.PENDING: return '#EF4444'; // Red
            default: return '#003B73';
        }
    }

    issues.forEach(issue => {
      const color = getStatusColor(issue.status);
      
      // Create a custom icon using HTML/CSS
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });

      const marker = L.marker([issue.location.lat, issue.location.lng], { icon: customIcon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div class="font-sans min-w-[200px]">
            <h3 class="font-bold text-primary mb-1 text-base">${issue.title}</h3>
            <p class="text-xs text-gray-500 mb-2 uppercase tracking-wide">${issue.category}</p>
            <span class="px-2 py-1 rounded-full text-xs text-white font-bold" style="background-color: ${color}">
              ${issue.status}
            </span>
            ${issue.imageUrl ? `<div class="mt-3 rounded-md overflow-hidden h-24 w-full bg-gray-100"><img src="${issue.imageUrl}" style="width:100%; height:100%; object-fit:cover;" /></div>` : ''}
          </div>
        `);
      
      // Attach issue ID to marker for easy lookup
      (marker as any).issueId = issue.id;

      marker.on('click', () => onSelectIssue(issue));
      markersRef.current.push(marker);
    });

  }, [issues, onSelectIssue]);

  // Handle focus changes (flyTo)
  useEffect(() => {
    if (mapRef.current && focusedIssue) {
      mapRef.current.flyTo([focusedIssue.location.lat, focusedIssue.location.lng], 16, {
        animate: true,
        duration: 1.5
      });

      // Find marker and open popup
      const marker = markersRef.current.find(m => (m as any).issueId === focusedIssue.id);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [focusedIssue]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[400px] bg-gray-100 z-0" style={{ isolation: 'isolate' }} />;
};

export default IssueMap;