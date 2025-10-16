import React from 'react';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = '📄',
    title,
    description,
    action
}) => {
    return (
        <div className="empty-state">
            <div className="empty-state-content">
                <div className="empty-state-icon">{icon}</div>
                <h3 className="empty-state-title">{title}</h3>
                <p className="empty-state-description">{description}</p>
                {action && (
                    <button 
                        className="empty-state-action"
                        onClick={action.onClick}
                    >
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    );
};