import React from 'react';
import ProfilePanel from './ProfilePanel';
import { User, Issue } from '../types';

interface ProfileSettingsPanelProps {
    user: User;
    issues: Issue[];
    onUpdateUser: (updatedUser: User) => void;
    onLogout?: () => void;
    themeMode?: 'light' | 'dark';
    onThemeModeChange?: (mode: 'light' | 'dark') => void;
}

const ProfileSettingsPanel: React.FC<ProfileSettingsPanelProps> = ({
    user,
    issues,
    onUpdateUser,
    // Extra props accepted but delegated later if needed
}) => {
    return (
        <ProfilePanel
            user={user}
            issues={issues}
            onUpdateUser={onUpdateUser}
        />
    );
};

export default ProfileSettingsPanel;
