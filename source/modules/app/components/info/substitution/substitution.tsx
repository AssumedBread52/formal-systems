import { ReactElement } from 'react';
import { RenderMath } from '../common/render-math/render-math';

export const Substitution = (): ReactElement => {
  return (
    <section>
      <h3>
        Substitution
      </h3>
      <p>
        <RenderMath inline>
          Given a function $$F$$ from $$VR$$ to $$EX$$, we denote by $$\sigma_F$$ or just $$\sigma$$ the function from $$EX$$
          to $$EX$$ defined recursively for nonempty sequences by
        </RenderMath>
        <RenderMath>
          \begin{'{'}split{'}'}
          \sigma(\langle\alpha\rangle)=F(\alpha)~~~~&\text{'{'}for{'}'}~\alpha\in VR;\\
          \sigma(\langle\alpha\rangle)=\langle\alpha\rangle~~~~&\text{'{'}for{'}'}~\alpha\notin VR;\\
          \sigma(g\frown h)=\sigma(g)\frown\sigma(h)~~~~&\text{'{'}for{'}'}~g,h\in EX.
          \end{'{'}split{'}'}
        </RenderMath>
        <RenderMath inline>
          We also define $$\sigma(\emptyset)=\emptyset$$. We call $$\sigma$$ a <em>simultaneous substitution</em> (or just
          <em>substitution</em>) with <em>substitution map</em> $$F$$.
        </RenderMath>
        <br />
        <RenderMath inline>
          We also denote (with abuse of notation) by $$\sigma(E)$$ a substitution on a collection of expressions
          $$E\subseteq EX$$, i.e. the set $$\{'{'}\sigma(e)\vert e\in E\{'}'}$$. The collection $$\sigma(E)$$ may of course
          contain fewer expressions than $$E$$ because duplicate expressions could result from the substitution.
        </RenderMath>
      </p>
    </section>
  );
};
