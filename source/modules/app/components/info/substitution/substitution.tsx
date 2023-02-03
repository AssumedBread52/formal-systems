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
          Using a substitution map $$F:VR\to EX$$, we denote a simultaneous substitution function by $$\sigma_F$$ or just
          $$\sigma$$ when $$F$$ is understood. $$\sigma_F:EX\to EX$$ is defined by
        </RenderMath>
        <RenderMath>
          \begin{'{'}aligned{'}'}
          \sigma(\langle\alpha\rangle)=&F(\alpha)&\text{'{'}for{'}'}~\alpha\in VR;\\
          \sigma(\langle\alpha\rangle)=&\langle\alpha\rangle&\text{'{'}for{'}'}~\alpha\notin VR;\\
          \sigma(g\frown h)=&\sigma(g)\frown\sigma(h)&\text{'{'}for{'}'}~g,h\in EX.
          \end{'{'}aligned{'}'}
        </RenderMath>
        <RenderMath inline>
          We also define $$\sigma(\emptyset)=\emptyset$$.
        </RenderMath>
        <br />
        <br />
        <RenderMath inline>
          We also denote (with abuse of notation) by $$\sigma(E)$$ a substitution on a collection of expressions
          $$E\subseteq EX$$, i.e. the set $$\sigma(E)=\{'{'}\sigma(e):e\in E\{'}'}$$. The collection $$\sigma(E)$$ may of course
          contain fewer expressions than $$E$$ because duplicate expressions could result from the substitution.
        </RenderMath>
      </p>
    </section>
  );
};
