import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../../../providers/session';
import { USE_MOCKS } from '../../../commons/config/env';
import {
  createTrip,
  deleteTrip,
  getTrip,
  getTripActivities,
  getTripDeletionPreview,
  getTrips,
  updateTrip,
} from './services';
import type { CreateTripInput, Trip, UpdateTripInput } from './contract';
import { isTripAccessError } from './tripAccessError';
import { tripQueryKeys } from './tripQueryKeys';

function useTripList<T = Trip[]>(select?: (trips: Trip[]) => T) {
  const { uid } = useSession();
  return useQuery({
    queryKey: tripQueryKeys.list(uid),
    queryFn: getTrips,
    enabled: USE_MOCKS,
    initialData: USE_MOCKS ? undefined : [],
    gcTime: USE_MOCKS ? undefined : Infinity,
    select,
  });
}

export function useTrips() {
  return useTripList();
}

export function useTrip(id: string) {
  const { uid } = useSession();
  const fromList = useTripList(
    (trips) => trips.find((trip) => trip.id === id) ?? null,
  );
  const mock = useQuery({
    queryKey: tripQueryKeys.detail(uid, id),
    queryFn: () => getTrip(id),
    enabled: USE_MOCKS && Boolean(id),
  });
  return USE_MOCKS ? mock : fromList;
}

export function useTripActivities(tripId: string) {
  const { uid } = useSession();
  return useQuery({
    queryKey: [...tripQueryKeys.detail(uid, tripId), 'activities'],
    queryFn: () => getTripActivities(tripId),
    enabled: USE_MOCKS && Boolean(tripId),
  });
}

function useSessionTrips() {
  const client = useQueryClient();
  const { uid } = useSession();
  const listKey = tripQueryKeys.list(uid);

  function upsert(trip: Trip) {
    client.setQueryData<Trip[]>(listKey, (previous = []) =>
      previous.some(({ id }) => trip.id === id)
        ? previous.map((item) => (item.id === trip.id ? trip : item))
        : [...previous, trip],
    );
  }

  function remove(id: string) {
    client.setQueryData<Trip[]>(listKey, (previous = []) =>
      previous.filter((trip) => trip.id !== id),
    );
  }

  function onAccessError(error: unknown, id: string) {
    if (!isTripAccessError(error)) return;
    if (USE_MOCKS)
      void client.invalidateQueries({ queryKey: listKey, exact: true });
    else remove(id);
  }

  return { client, uid, listKey, upsert, remove, onAccessError };
}

export function useTripActions() {
  const { client, uid, listKey, upsert, remove, onAccessError } =
    useSessionTrips();

  function refreshList() {
    void client.invalidateQueries({ queryKey: listKey, exact: true });
  }

  async function create(input: CreateTripInput) {
    const trip = await createTrip(input);
    if (USE_MOCKS) refreshList();
    else upsert(trip);
  }

  async function update(id: string, input: UpdateTripInput) {
    try {
      const trip = await updateTrip(id, input);
      if (USE_MOCKS) refreshList();
      else upsert(trip);
      void client.invalidateQueries({
        queryKey: tripQueryKeys.detail(uid, trip.id),
      });
    } catch (error) {
      onAccessError(error, id);
      throw error;
    }
  }

  async function removeTrip(id: string) {
    try {
      await deleteTrip(id);
      if (USE_MOCKS) refreshList();
      else remove(id);
      client.removeQueries({ queryKey: tripQueryKeys.detail(uid, id) });
    } catch (error) {
      onAccessError(error, id);
      throw error;
    }
  }

  return { create, update, remove: removeTrip };
}

const PREVIEW_SIZE = 20;

export function useTripDeletionPreview(id: string | undefined, page: number) {
  const { uid, onAccessError } = useSessionTrips();
  return useQuery({
    queryKey: [
      ...tripQueryKeys.detail(uid, id),
      'delete-preview',
      page,
      PREVIEW_SIZE,
    ],
    queryFn: async ({ signal }) => {
      if (!id) throw new Error('Viagem não selecionada.');
      try {
        return await getTripDeletionPreview(id, page, PREVIEW_SIZE, signal);
      } catch (error) {
        onAccessError(error, id);
        throw error;
      }
    },
    enabled: Boolean(id),
    gcTime: 0,
  });
}
