import { cache } from 'react'
import { parse } from 'rss-to-json'

/**
 * TODO: Add your podcast config here
 */
export const podcastConfig: PodcastConfig = {
  /**
   * Step 1. Add your podcast directories here
   * We support links from:
   *   Apple Podcasts, Google Podcasts, Spotify, Stitcher, Overcast,
   *   Pocket Casts Castro, 小宇宙, 哔哩哔哩, YouTube
   */
  directories: [
    'https://geo.itunes.apple.com/us/podcast/id1592290139?ct=rephonic&mt=2',
    'https://open.spotify.com/show/6AwPXFseiDYweHh74mBqQd',
    'https://podcasts.google.com/feed/aHR0cDovL3d3dy54aW1hbGF5YS5jb20vYWxidW0vNTQyMTIwMjYueG1s',
    'https://www.xiaoyuzhoufm.com/podcast/61d4278c2654166e94d07d1f',
  ],
  /**
   * Step 2. Add your podcast hosts here
   */
  hosts: [
    {
      name: 'NebulaGraph 星球',
      link: 'https://nebula-podcast-cn.siwei.io/',
    },
  ],
}

/**
 * Get podcast via RSS feed.
 */
export const getPodcast = cache(async () => {
  const feed = await parse(process.env.NEXT_PUBLIC_PODCAST_RSS || '')
  const podcast: Podcast = {
    title: feed.title,
    description: feed.description,
    link: feed.link,
    coverArt: feed.image,
  }

  return podcast
})

/**
 * Encode episode id.
 * (Certain episode id contains special characters that are not allowed in URL)
 */
function encodeEpisodeId(raw: string): string {
  if (!raw.startsWith('http')) {
    return raw
  }

  const url = new URL(raw)
  const path = url.pathname.split('/')
  const lastPathname = path[path.length - 1]

  if (lastPathname === '' && url.search) {
    return url.search.slice(1)
  }

  return lastPathname
}

/**
 * Get podcast episodes via RSS feed.
 */
export const getPodcastEpisodes = cache(async () => {
  const feed = await parse(process.env.NEXT_PUBLIC_PODCAST_RSS || '')
  const episodes: Episode[] = feed.items.map((item) => ({
    id: encodeEpisodeId(item.id ?? item.link),
    title: item.title,
    description: item.description,
    link: item.link,
    published: item.published,
    content: item.content,
    duration: item.itunes_duration,
    enclosure: item.enclosures[0],
    coverArt: item.itunes_image?.href,
  }))

  return episodes
})

/**
 * Get podcast episode by id.
 */
export const getPodcastEpisode = cache(async (id: string) => {
  const episodes = await getPodcastEpisodes()
  const decodedId = decodeURIComponent(id)
  return episodes.find(
    (episode) => episode.id === decodedId || episode.link.endsWith(decodedId)
  )
})
