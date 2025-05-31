import React, { useState } from 'react';
import axios from 'axios';

interface Lead {
    name: string;
    email_address: string;
    company_name?: string;
    phone_number?: string;
    website_url?: string;
}

interface ZohoResponse {
    successfulLeadsCount: number;
    failedLeadsCount: number;
    failedDetails: any[];
    message: string;
    zohoApiResponse: any;
}

const LeadImporter: React.FC = () => {
    const [leadsToSync, setLeadsToSync] = useState<Lead[]>([
        { name: 'John Doe', email_address: 'john.doe@example.com', company_name: 'Acme Corp', phone_number: '123-456-7890', website_url: 'acmecorp.com' },
        { name: 'Jane Smith', email_address: 'jane.smith@another.com', company_name: 'Global Solutions', phone_number: '098-765-4321', website_url: 'globalsolutions.net' },
    ]);

    const [syncStatus, setSyncStatus] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleSyncLeadsToZoho = async () => {
        setSyncStatus('Syncing leads...');
        setError(null);

        try {
            const response = await axios.post<ZohoResponse>('/api/zoho/add-lead', { leads: leadsToSync });

            if (response.status === 200) {
                const data = response.data;
                setSyncStatus(`Sync complete! Successful: ${data.successfulLeadsCount}, Failed: ${data.failedLeadsCount}. Check console for details.`);
                console.log('Zoho Sync Response:', data);
            } else {
                setSyncStatus('Sync failed with unexpected status.');
                setError(response.data.message || 'Unknown error');
            }
        } catch (err: any) {
            console.error('Error sending leads to Next.js API:', err.response ? err.response.data : err.message);
            setSyncStatus('Sync failed!');
            setError(err.response?.data?.message || err.message);
        }
    };
    const handleClick = () => {
        window.open('/api/zoho/initiate-auth', '_blank');
    };

    return (
        <div>
            <button onClick={handleClick} className='btn bg-cyan-700 text-white'>
                CONNECT TO ZOHO CRM
            </button>
            <h1>Lead Importer to Zoho CRM</h1>
            <button onClick={handleSyncLeadsToZoho} className='btn p-3 rounded bg-cyan-700 text-white' disabled={syncStatus === 'Syncing leads...'}>
                Sync Leads to Zoho
            </button>
            <p>{syncStatus}</p>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            <h2>Leads to be Synced:</h2>
            <ul>
                {leadsToSync.map((lead, index) => (
                    <li key={index}>
                        {lead.name} - {lead.email_address} - {lead.company_name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LeadImporter;
