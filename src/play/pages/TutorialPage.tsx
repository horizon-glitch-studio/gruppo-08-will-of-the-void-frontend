import { ButtonLink } from '@/shared/components/Button'
import { Panel } from '@/shared/components/Panel'
import { paths } from '../routes/paths'

/** Tutorial screen. Not written yet: says it is coming, and leads back to the hub or to the story. */
export function TutorialPage() {
  return (
    <section className="column gap-m">
      <Panel as="div">
        <div className="column gap-s">
          <h2 className="h3">Coming soon</h2>
          <p>The tutorial is on its way. Until then, the Arena awaits: every battle feeds the Void.</p>
        </div>
      </Panel>
      <div className="row gap-s">
        <ButtonLink to={paths.hub} variant="primary">
          Back to the hub
        </ButtonLink>
        <ButtonLink to={paths.story(1)}>Replay the story</ButtonLink>
      </div>
    </section>
  )
}
