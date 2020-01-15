import React, { useContext, useEffect, useState } from 'react'
import { RewardsGroups } from './RewardsGroups'
import { Web3Context } from './WithWeb3Context'
import Button from './Button'
import Loadable from './Loadable'
import NoData from './NoData'
import * as Icons from './Icons'
import rewardsService from '../services/rewards.service'

export const Rewards = () => {
  const web3Context = useContext(Web3Context)
  const [isFetching, setIsFetching] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [data, setData] = useState([])

  useEffect(() => {
    let shouldSetState = true
    rewardsService.fetchAvailableRewards(web3Context)
      .then((groups) => {
        if (shouldSetState) {
          setIsFetching(false)
          setData(groups)
        }
      })
      .catch((error) => {
        shouldSetState && setIsFetching(false)
      })

    return () => {
      shouldSetState = false
    }
  }, [])

  return (
    <Loadable isFetching={isFetching}>
      { data.length === 0 ?
        <NoData
          title='No rewards yet!'
          iconComponent={<Icons.Badge width={100} height={100} />}
          content='You can withdraw any future earned rewards from your delegated stake on this page.'
        /> :
        <>
          <RewardsGroups groups={showAll ? data : data.slice(0, 3)} />
          { data.length > 3 &&
            <Button
              className="btn btn-default btn-sm see-all-btn"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'SEE LESS' : `SEE ALL ${data.length - 2}`}
            </Button>
          }
        </>
      }
    </Loadable>
  )
}
