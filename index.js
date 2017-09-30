const request = require('request-promise')

async function getGroupStats (leaderBoardId) {
  const lb = await request(`http://pickem.euw.lolesports.com/en-GB/api/get_vs_list_rankings/${leaderBoardId}`, { json: true })

  const groupUserIds = lb.stageToRankings.group.map(user => user.id)// .slice(0, 20)
  console.info('Analyzing the picks of', groupUserIds.length, 'users...')

  const groupsStats = {}

  for (const i in groupUserIds) {
    const userId = groupUserIds[i]
    const pick = await request(`http://pickem.euw.lolesports.com/en-GB/api/get_group_picks/series/4/user/${userId}`, { json: true })

    if (pick.submitted) {
      pick.groups.forEach(group => {
        if (!groupsStats[group.groupKey]) {
          groupsStats[group.groupKey] = []
        }

        group.teams.forEach((team, index) => {
          if (groupsStats[group.groupKey].length <= index) {
            groupsStats[group.groupKey].push({})
          }

          groupsStats[group.groupKey][index][team.shortName] = (groupsStats[group.groupKey][index][team.shortName] || 0) + 1
        })
      })
    }
  }

  console.info('')
  // console.log(groupsStats)
  // console.info('')

  for (const groupKey in groupsStats) {
    console.info('Group', groupKey)
    groupsStats[groupKey].forEach((teams, index) => {
      let total = 0
      for (const team in teams) {
        total += teams[team]
      }
      let teamsStats = []
      for (const team in teams) {
        const avg = Math.round(teams[team] * 100 / total)
        teamsStats.push(`${team} ${avg}%`)
      }
      console.info('\t', index + 1, '=>', teamsStats.join(', '))
    })
  }
}

let leaderBoardId = 342919
if (process.argv.length > 2 && +process.argv[2] > 0) {
  leaderBoardId = +process.argv[2]
}

console.info('Leaderboard ID:', leaderBoardId)
getGroupStats(leaderBoardId).catch(err => console.error('ERROR:', err))
