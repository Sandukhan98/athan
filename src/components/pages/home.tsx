import { useStore } from '@/lib/store';
import { PrayerKey } from '@/types/prayer';
import * as adhan from 'adhan';
import { format } from 'date-fns';
import { capitalize } from 'lodash';
import { useEffect, useState } from 'react';
import Prayers from '../molecules/prayers';
import Layout from '../templates/layout';

const Home = () => {
  const { location } = useStore();
  const [countdown, setCountdown] = useState<string>();
  const coordinates = new adhan.Coordinates(location.coords.latitude, location.coords.longitude);
  const params = adhan.CalculationMethod.MuslimWorldLeague();
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  const todayPrayerTimes = new adhan.PrayerTimes(coordinates, today, params);
  const tomorrowPrayerTimes = new adhan.PrayerTimes(coordinates, tomorrow, params);

  const value = (v: string) => (v === 'none' ? null : v);

  const nextPrayerToday = value(todayPrayerTimes.nextPrayer()) as keyof adhan.PrayerTimes;
  const nextPrayerTomorrow = value(tomorrowPrayerTimes.nextPrayer()) as keyof adhan.PrayerTimes;

  const nextPrayer = nextPrayerToday || nextPrayerTomorrow;
  const nextPrayerTime = (
    nextPrayerToday ? todayPrayerTimes[nextPrayerToday] : tomorrowPrayerTimes[nextPrayerTomorrow]
  ) as Date;

  const countdownTillNextPrayer = () => {
    const now = new Date();
    const diff = nextPrayerTime.getTime() - now.getTime();
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    // Format as HH:MM:SS
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(countdownTillNextPrayer());
    }, 1000);
    return () => clearInterval(interval);
  });

  const allowedKeys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const todayPrayers = Object.entries(todayPrayerTimes)
    .filter(([key]) => allowedKeys.includes(key))
    .map(([key, value]) => ({ name: capitalize(key), time: value, id: key }));

  const tomorrowPrayers = Object.entries(tomorrowPrayerTimes)
    .filter(([key]) => allowedKeys.includes(key))
    .map(([key, value]) => ({ name: capitalize(key), time: value, id: key }));

  return (
    <Layout>
      <div className="flex flex-row">
        <div className="flex flex-col gap-2 flex-grow">
          <h2 className="font-light text-3xl">
            Next prayer in <span className="text-accent">{countdown}</span>
          </h2>
          <h1 className="text-[112px]">
            <span className="font-black capitalize">{nextPrayer}</span> {format(nextPrayerTime, 'hh:mm')}
          </h1>
          {/* <p className="text-accent">5th Safar, 1445</p> TODO: */}
          <p className="text-accent">{format(today, 'do MMMM, yyyy')}</p>
        </div>
        <div>
          <div className="flex flex-row gap-2">
            <p>Select location</p>
            <img src="/images/icons/edit.svg" alt="location" className="w-6 h-6 text-accent" />
          </div>
        </div>
      </div>
      <Prayers prayers={todayPrayers} className="mt-10" nextPrayer={nextPrayerToday as PrayerKey | null}>
        Today
      </Prayers>
      <Prayers prayers={tomorrowPrayers} className="mt-10" nextPrayer={nextPrayerTomorrow as PrayerKey | null}>
        Tomorrow
      </Prayers>
    </Layout>
  );
};

export default Home;
