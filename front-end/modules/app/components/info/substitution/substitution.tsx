import { ReactElement } from 'react';
import { RenderMath } from '../common/render-math/render-math';

export const Substitution = (): ReactElement => {
  return (
    <section>
      <h3>
        Substitution
      </h3>
      <p>
        A substitution map is a function which maps from the set of variable symbols to the set of expressions.
        <RenderMath content='F:VR\to EX' />
        A simultaneous substitution is a function which maps expressions to expressions using a substitution map.
        <RenderMath content='\sigma_F:EX\to EX' />
        The simultaneous substitution for expressions of length one are performed using the substitution map.
        <RenderMath content='\sigma_F(\langle\alpha\rangle)=\begin{cases}\langle F(\alpha)\rangle&\alpha\in VR\\\langle\alpha\rangle&\alpha\notin VR\end{cases}' />
        Expressions longer than length one are recursively computed.
        <RenderMath content='\sigma_F(g\frown h)=\sigma_F(g)\frown\sigma_F(h)' />
        For the sake of brevity sometimes we will apply a simultaneous substitution to a set of expressions.
        <RenderMath content='\sigma_F:\mathcal{P}(EX)\to\mathcal{P}(EX)' />
        <RenderMath content='\sigma_F(E)=\{\sigma_F(e)::e\in E\}' />
      </p>
    </section>
  );
};
