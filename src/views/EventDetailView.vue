<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiUrl, authFetch } from '../services/api'

const route = useRoute()
const router = useRouter()
const event = ref(null)
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const geocodeCache = new Map()

function fallbackImage() { return '/event-placeholder.svg' }
function availabilityText(item) {
  if (item.isPast) return 'Past event'
  if (item.capacity == null || item.availablePlaces == null) return 'Capacity unavailable'
  if (item.isSoldOut) return 'Sold out'
  return `${item.availablePlaces} of ${item.capacity} places left`
}

function showSuccess(message) {
  successMessage.value = message
  window.setTimeout(() => {
    if (successMessage.value === message) successMessage.value = ''
  }, 4500)
}
function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

async function getCoordinates(location) {
  const key = String(location || '').trim().toLowerCase()
  if (!key) return null
  if (geocodeCache.has(key)) return geocodeCache.get(key)

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 6000)
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      { signal: controller.signal, headers: { Accept: 'application/json' } },
    )
    if (!response.ok) return null
    const data = await response.json()
    const result = data.length ? { lat: data[0].lat, lon: data[0].lon } : null
    geocodeCache.set(key, result)
    return result
  } catch (error) {
    if (error.name !== 'AbortError') console.error(error)
    return null
  } finally {
    window.clearTimeout(timeout)
  }
}

async function loadEvent() {
  loading.value = true
  errorMessage.value = ''
  try {
    let response = await fetch(apiUrl(`/api/events/${route.params.id}`))
    let data = await response.json()

    // Fallback to the public event list if a direct event request cannot be resolved.
    // This keeps the details page reliable on a clean local setup.
    if (!response.ok) {
      response = await fetch(apiUrl('/api/events'))
      const allEvents = await response.json()
      if (!response.ok || !Array.isArray(allEvents)) {
        return (errorMessage.value = data.message || 'Could not load event.')
      }
      data = allEvents.find((item) => String(item._id) === String(route.params.id))
      if (!data) return (errorMessage.value = 'Event not found.')
    }

    const coordinates = await getCoordinates(data.location)
    if (coordinates) Object.assign(data, coordinates)
    event.value = data
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Could not connect to the server.'
  } finally { loading.value = false }
}

async function bookEvent() {
  successMessage.value = ''; errorMessage.value = ''
  const token = localStorage.getItem('token')
  if (!token) {
    router.push({ path: '/login', query: { reason: 'booking', redirect: route.fullPath } })
    return
  }
  try {
    const response = await authFetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: event.value._id }),
    })
    const data = await response.json()
    if (!response.ok) return (errorMessage.value = data.message || 'Booking failed.')
    showSuccess(`Booking confirmed for ${event.value.title}. You can view it in your Dashboard.${data.notificationMode === 'sendgrid' ? ' A confirmation email was sent.' : ''}`)
    await loadEvent()
  } catch (error) { console.error(error); errorMessage.value = 'Could not connect to the server.' }
}

function openMap() {
  if (!event.value?.lat || !event.value?.lon) return
  window.open(`https://www.openstreetmap.org/?mlat=${event.value.lat}&mlon=${event.value.lon}#map=16/${event.value.lat}/${event.value.lon}`, '_blank')
}
function getMapEmbedUrl() {
  if (!event.value?.lat || !event.value?.lon) return ''
  const lat = Number(event.value.lat), lon = Number(event.value.lon)
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01}%2C${lat - 0.006}%2C${lon + 0.01}%2C${lat + 0.006}&layer=mapnik&marker=${lat}%2C${lon}`
}

onMounted(loadEvent)
</script>

<template>
  <main>
    <p><RouterLink class="text-link" to="/events">← Back to events</RouterLink></p>
    <p v-if="loading" class="muted">Loading event...</p>
    <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="message success booking-toast" aria-live="polite">{{ successMessage }}</p>

    <article v-if="event" class="event-card event-detail-card">
      <img class="event-image event-image-large" :src="event.imageUrl || fallbackImage()" :alt="event.title" @error="$event.target.src = fallbackImage()" />
      <div class="event-card-body">
        <div class="card-topline">
          <span class="badge">{{ event.category }}</span>
          <span :class="['availability', { sold: event.isSoldOut || event.isPast }]">{{ availabilityText(event) }}</span>
        </div>
        <h1>{{ event.title }}</h1>
        <p>{{ event.description }}</p>
        <div class="event-meta event-meta-four">
          <span><strong>Date:</strong> {{ formatDate(event.date) }}</span>
          <span><strong>Time:</strong> {{ event.time || 'Time not set' }}</span>
          <span><strong>Location:</strong> {{ event.location }}</span>
          <span><strong>Price:</strong> {{ event.price === 0 ? 'Free' : `€${event.price}` }}</span>
        </div>
        <div class="event-actions">
          <button :disabled="event.isSoldOut || event.isPast" @click="bookEvent">{{ event.isPast ? 'Event Finished' : event.isSoldOut ? 'Sold Out' : 'Book Event' }}</button>
          <button v-if="event.lat && event.lon" class="secondary" @click="openMap">View on Map</button>
        </div>
        <iframe v-if="event.lat && event.lon" :src="getMapEmbedUrl()" height="300" title="Event location map" loading="lazy"></iframe>
        <p v-else class="muted">Map location unavailable.</p>
      </div>
    </article>
  </main>
</template>
