import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Issue, IssueCategory, IssueStatus, UserRole } from '../types';
import { SEVILLA_CENTER } from '../constants';
import { useLocale } from '../i18n';

const CATEGORY_KEYS: Record<string, string> = {
  [IssueCategory.INFRASTRUCTURE]: 'cat.infra',
  [IssueCategory.LIGHTING]: 'cat.lighting',
  [IssueCategory.CLEANING]: 'cat.cleaning',
  [IssueCategory.NOISE]: 'cat.noise',
  [IssueCategory.PARKS]: 'cat.parks',
  [IssueCategory.OTHER]: 'cat.other'
};

const STATUS_KEYS: Record<string, string> = {
  [IssueStatus.PENDING]: 'status.pending',
  [IssueStatus.IN_PROGRESS]: 'status.in_progress',
  [IssueStatus.RESOLVED]: 'status.resolved'
};

interface IssueMapProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  focusedIssue?: Issue | null;
}

const IssueMap: React.FC<IssueMapProps> = ({ issues, onSelectIssue, focusedIssue }) => {
  const { t } = useLocale();
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

    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

    const getStatusColor = (status: IssueStatus) => {
      switch (status) {
        case IssueStatus.RESOLVED: return '#48C9B0'; // Secondary/Green
        case IssueStatus.IN_PROGRESS: return '#F59E0B'; // Amber
        case IssueStatus.PENDING: return '#EF4444'; // Red
        default: return '#003B73';
      }
    }

    issues.forEach(issue => {
      if (!issue.location) return;
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
          <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; min-width: 200px;">
            <h3 style="font-weight: 800; margin: 0 0 4px 0; font-size: 14px; color: ${isDark ? '#e2e8f0' : '#003B73'};">
              ${issue.title}
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: ${isDark ? '#cbd5e1' : '#6b7280'};">
              ${t(CATEGORY_KEYS[issue.category || ''] || 'cat.other')}
            </p>
            <span style="display: inline-block; padding: 4px 8px; border-radius: 9999px; font-size: 11px; color: white; font-weight: 800; background-color: ${color}">
              ${t(STATUS_KEYS[issue.status] || 'status.pending')}
            </span>
            ${issue.imageUrl ? `<div style="margin-top: 10px; border-radius: 8px; overflow: hidden; height: 96px; width: 100%; background: ${isDark ? 'rgba(148,163,184,0.12)' : '#f3f4f6'};"><img src="${issue.imageUrl}" style="width:100%; height:100%; object-fit:cover;" /></div>` : ''}
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
    if (mapRef.current && focusedIssue && focusedIssue.location) {
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

  return <div ref={mapContainerRef} className="w-full h-full min-h-[400px] bg-gray-100 dark:bg-slate-800 z-0" style={{ isolation: 'isolate' }} />;
};

export default IssueMap;