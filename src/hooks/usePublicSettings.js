import { useState, useEffect } from 'react';
import { getPublicSettings } from '../api/settings';

export const usePublicSettings = () => {
  const [settings, setSettings] = useState({
    usd_to_ngn_rate:          1560,
    min_deposit:              11.5,
    min_withdrawal:           11.5,
    withdrawal_fee_below:     16,
    withdrawal_fee_above:     10,
    withdrawal_fee_threshold: 100,
    withdrawal_days:          'Monday to Sunday',
    withdrawal_hours:         '10:00 AM – 05:00 PM',
    loading: true,
  });

  useEffect(() => {
    getPublicSettings()
      .then(res => setSettings({ ...res.data, loading: false }))
      .catch(() => setSettings(prev => ({ ...prev, loading: false })));
  }, []);

  return settings;
};