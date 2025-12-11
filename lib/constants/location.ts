export const OFFICIAL_LOCATION = {
  name: 'Condomínio do Edifício The Point Offices',
  address: 'R. Moema, 25, Sala 814 - Divino Espírito Santo, Vila Velha - ES, 29107-250',
  city: 'Vila Velha',
  state: 'ES',
}

export const OFFICIAL_LOCATION_QUERY = `${OFFICIAL_LOCATION.name} ${OFFICIAL_LOCATION.address}`

export const OFFICIAL_LOCATION_SHARE_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  OFFICIAL_LOCATION_QUERY
)}`

export const OFFICIAL_LOCATION_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  OFFICIAL_LOCATION_QUERY
)}&output=embed`
